use glob::glob;
use std::path::PathBuf;

pub fn normalize_glob(globs: Vec<PathBuf>) -> Vec<PathBuf> {
    let mut paths = Vec::new();

    for file in globs {
        for entry in glob(file.to_str().unwrap()).unwrap() {
            match entry {
                Ok(path) => {
                    let path = &std::fs::canonicalize(path).unwrap();

                    paths.push(path.clone());
                }
                Err(e) => println!("{:?}", e),
            }
        }
    }
    paths
}