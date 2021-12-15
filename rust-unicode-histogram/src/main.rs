mod utils;

use rayon::prelude::*;
use std::{collections::HashMap, fs::read_to_string, path::PathBuf};
use structopt::StructOpt;
use utils::normalize_glob;
use serde::{Deserialize, Serialize};

#[derive(Debug, StructOpt)]
#[structopt(name = "example", about = "An example of StructOpt usage.")]
struct Opt {
    #[structopt(parse(from_os_str))]
    files: Vec<PathBuf>,

    #[structopt(short = "o", long = "out", parse(from_os_str))]
    out: Option<PathBuf>,
}

fn main() {
    let opt = Opt::from_args();

    let files = normalize_glob(opt.files);

    let result = files.par_iter().map(CodePointHistogram::of_file).reduce(
        CodePointHistogram::default,
        |mut acc, histogram| {
            acc.add(&histogram);
            acc
        },
    );

    let json = serde_json::to_string(&result).unwrap();

    if let Some(out) = opt.out {
        std::fs::write(out, json).unwrap();
    } else {
        println!("{}", json);
    }
}


#[derive(Debug, Default, Serialize, Deserialize)]
struct CodePointHistogram {
    code_point_counts: HashMap<char, i64>,
}

impl CodePointHistogram {
    pub fn add(&mut self, other: &CodePointHistogram) {
        for (code_point, other_count) in other.code_point_counts.iter() {
            let count = self
                .code_point_counts
                .entry(code_point.clone())
                .or_insert(0);
            *count += other_count;
        }
    }

    pub fn of_file(file: &PathBuf) -> CodePointHistogram {
        read_to_string(file)
            .unwrap()
            .chars()
            .fold(CodePointHistogram::default(), |mut acc, c| {
                *acc.code_point_counts.entry(c).or_insert(0) += 1;
                acc
            })
    }
}

