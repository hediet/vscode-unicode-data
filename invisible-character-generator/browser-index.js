
window.onload = async () => {
	await new Promise(r => setTimeout(r, 100));

	/**
	 * @type {HTMLCanvasElement}
	 */
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");

	let w = 0;

	var start = window.performance.now();

	/**
	 * @type {{ codePoint: number, width: number }[]}
	 */
	let invisibleCharacters = [];

	/**
	 * @param {string} character 
	 * @param {number} width 
	 */
	function reportInvisibleCharacter(character, width) {
		invisibleCharacters.push({
			codePoint: character.codePointAt(0),
			width
		});
		console.log(character.codePointAt(0).toString(16), character, width);
	}

	let i = 0;
	for (let c of allUnicodeCharacters()) {
		i++;
		/*if (i > 100) {
			break;
		}*/

		ctx.textAlign = "start";
		ctx.textBaseline = "top";
		ctx.font = "30px serif";
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillText(c, 10, 10);
		const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		if (isAllWhite(data)) {
            reportInvisibleCharacter(c, ctx.measureText(c).width);
		}

		//await new Promise((resolve) => setTimeout(resolve, 1));
	}

	handleData(invisibleCharacters);

	var end = window.performance.now();
	console.log(`Execution time: ${end - start} ms`);
	console.log(w);
};

/**
 * @param {ImageData} data
 */
function isAllWhite(data) {
    for (let i = 0; i < data.data.length; i++) {
        if (data.data[i] !== 0) {
            return false;
        }
    }
    return true;
}

// Copied from blocks.json
const blocks =
	'{"Basic Latin":[0,128],"Latin-1 Supplement":[128,128],"Latin Extended-A":[256,128],"Latin Extended-B":[384,208],"IPA Extensions":[592,96],"Spacing Modifier Letters":[688,80],"Combining Diacritical Marks":[768,112],"Greek and Coptic":[880,144],"Cyrillic":[1024,256],"Cyrillic Supplement":[1280,48],"Armenian":[1328,96],"Hebrew":[1424,112],"Arabic":[1536,256],"Syriac":[1792,80],"Arabic Supplement":[1872,48],"Thaana":[1920,64],"NKo":[1984,64],"Samaritan":[2048,64],"Mandaic":[2112,32],"Syriac Supplement":[2144,16],"Arabic Extended-B":[2160,48],"Arabic Extended-A":[2208,96],"Devanagari":[2304,128],"Bengali":[2432,128],"Gurmukhi":[2560,128],"Gujarati":[2688,128],"Oriya":[2816,128],"Tamil":[2944,128],"Telugu":[3072,128],"Kannada":[3200,128],"Malayalam":[3328,128],"Sinhala":[3456,128],"Thai":[3584,128],"Lao":[3712,128],"Tibetan":[3840,256],"Myanmar":[4096,160],"Georgian":[4256,96],"Hangul Jamo":[4352,256],"Ethiopic":[4608,384],"Ethiopic Supplement":[4992,32],"Cherokee":[5024,96],"Unified Canadian Aboriginal Syllabics":[5120,640],"Ogham":[5760,32],"Runic":[5792,96],"Tagalog":[5888,32],"Hanunoo":[5920,32],"Buhid":[5952,32],"Tagbanwa":[5984,32],"Khmer":[6016,128],"Mongolian":[6144,176],"Unified Canadian Aboriginal Syllabics Extended":[6320,80],"Limbu":[6400,80],"Tai Le":[6480,48],"New Tai Lue":[6528,96],"Khmer Symbols":[6624,32],"Buginese":[6656,32],"Tai Tham":[6688,144],"Combining Diacritical Marks Extended":[6832,80],"Balinese":[6912,128],"Sundanese":[7040,64],"Batak":[7104,64],"Lepcha":[7168,80],"Ol Chiki":[7248,48],"Cyrillic Extended-C":[7296,16],"Georgian Extended":[7312,48],"Sundanese Supplement":[7360,16],"Vedic Extensions":[7376,48],"Phonetic Extensions":[7424,128],"Phonetic Extensions Supplement":[7552,64],"Combining Diacritical Marks Supplement":[7616,64],"Latin Extended Additional":[7680,256],"Greek Extended":[7936,256],"General Punctuation":[8192,112],"Superscripts and Subscripts":[8304,48],"Currency Symbols":[8352,48],"Combining Diacritical Marks for Symbols":[8400,48],"Letterlike Symbols":[8448,80],"Number Forms":[8528,64],"Arrows":[8592,112],"Mathematical Operators":[8704,256],"Miscellaneous Technical":[8960,256],"Control Pictures":[9216,64],"Optical Character Recognition":[9280,32],"Enclosed Alphanumerics":[9312,160],"Box Drawing":[9472,128],"Block Elements":[9600,32],"Geometric Shapes":[9632,96],"Miscellaneous Symbols":[9728,256],"Dingbats":[9984,192],"Miscellaneous Mathematical Symbols-A":[10176,48],"Supplemental Arrows-A":[10224,16],"Braille Patterns":[10240,256],"Supplemental Arrows-B":[10496,128],"Miscellaneous Mathematical Symbols-B":[10624,128],"Supplemental Mathematical Operators":[10752,256],"Miscellaneous Symbols and Arrows":[11008,256],"Glagolitic":[11264,96],"Latin Extended-C":[11360,32],"Coptic":[11392,128],"Georgian Supplement":[11520,48],"Tifinagh":[11568,80],"Ethiopic Extended":[11648,96],"Cyrillic Extended-A":[11744,32],"Supplemental Punctuation":[11776,128],"CJK Radicals Supplement":[11904,128],"Kangxi Radicals":[12032,224],"Ideographic Description Characters":[12272,16],"CJK Symbols and Punctuation":[12288,64],"Hiragana":[12352,96],"Katakana":[12448,96],"Bopomofo":[12544,48],"Hangul Compatibility Jamo":[12592,96],"Kanbun":[12688,16],"Bopomofo Extended":[12704,32],"CJK Strokes":[12736,48],"Katakana Phonetic Extensions":[12784,16],"Enclosed CJK Letters and Months":[12800,256],"CJK Compatibility":[13056,256],"CJK Unified Ideographs Extension A":[13312,6592],"Yijing Hexagram Symbols":[19904,64],"CJK Unified Ideographs":[19968,20992],"Yi Syllables":[40960,1168],"Yi Radicals":[42128,64],"Lisu":[42192,48],"Vai":[42240,320],"Cyrillic Extended-B":[42560,96],"Bamum":[42656,96],"Modifier Tone Letters":[42752,32],"Latin Extended-D":[42784,224],"Syloti Nagri":[43008,48],"Common Indic Number Forms":[43056,16],"Phags-pa":[43072,64],"Saurashtra":[43136,96],"Devanagari Extended":[43232,32],"Kayah Li":[43264,48],"Rejang":[43312,48],"Hangul Jamo Extended-A":[43360,32],"Javanese":[43392,96],"Myanmar Extended-B":[43488,32],"Cham":[43520,96],"Myanmar Extended-A":[43616,32],"Tai Viet":[43648,96],"Meetei Mayek Extensions":[43744,32],"Ethiopic Extended-A":[43776,48],"Latin Extended-E":[43824,64],"Cherokee Supplement":[43888,80],"Meetei Mayek":[43968,64],"Hangul Syllables":[44032,11184],"Hangul Jamo Extended-B":[55216,80],"High Surrogates":[55296,896],"High Private Use Surrogates":[56192,128],"Low Surrogates":[56320,1024],"Private Use Area":[57344,6400],"CJK Compatibility Ideographs":[63744,512],"Alphabetic Presentation Forms":[64256,80],"Arabic Presentation Forms-A":[64336,688],"Variation Selectors":[65024,16],"Vertical Forms":[65040,16],"Combining Half Marks":[65056,16],"CJK Compatibility Forms":[65072,32],"Small Form Variants":[65104,32],"Arabic Presentation Forms-B":[65136,144],"Halfwidth and Fullwidth Forms":[65280,240],"Specials":[65520,16],"Linear B Syllabary":[65536,128],"Linear B Ideograms":[65664,128],"Aegean Numbers":[65792,64],"Ancient Greek Numbers":[65856,80],"Ancient Symbols":[65936,64],"Phaistos Disc":[66000,48],"Lycian":[66176,32],"Carian":[66208,64],"Coptic Epact Numbers":[66272,32],"Old Italic":[66304,48],"Gothic":[66352,32],"Old Permic":[66384,48],"Ugaritic":[66432,32],"Old Persian":[66464,64],"Deseret":[66560,80],"Shavian":[66640,48],"Osmanya":[66688,48],"Osage":[66736,80],"Elbasan":[66816,48],"Caucasian Albanian":[66864,64],"Vithkuqi":[66928,80],"Linear A":[67072,384],"Latin Extended-F":[67456,64],"Cypriot Syllabary":[67584,64],"Imperial Aramaic":[67648,32],"Palmyrene":[67680,32],"Nabataean":[67712,48],"Hatran":[67808,32],"Phoenician":[67840,32],"Lydian":[67872,32],"Meroitic Hieroglyphs":[67968,32],"Meroitic Cursive":[68000,96],"Kharoshthi":[68096,96],"Old South Arabian":[68192,32],"Old North Arabian":[68224,32],"Manichaean":[68288,64],"Avestan":[68352,64],"Inscriptional Parthian":[68416,32],"Inscriptional Pahlavi":[68448,32],"Psalter Pahlavi":[68480,48],"Old Turkic":[68608,80],"Old Hungarian":[68736,128],"Hanifi Rohingya":[68864,64],"Rumi Numeral Symbols":[69216,32],"Yezidi":[69248,64],"Old Sogdian":[69376,48],"Sogdian":[69424,64],"Old Uyghur":[69488,64],"Chorasmian":[69552,48],"Elymaic":[69600,32],"Brahmi":[69632,128],"Kaithi":[69760,80],"Sora Sompeng":[69840,48],"Chakma":[69888,80],"Mahajani":[69968,48],"Sharada":[70016,96],"Sinhala Archaic Numbers":[70112,32],"Khojki":[70144,80],"Multani":[70272,48],"Khudawadi":[70320,80],"Grantha":[70400,128],"Newa":[70656,128],"Tirhuta":[70784,96],"Siddham":[71040,128],"Modi":[71168,96],"Mongolian Supplement":[71264,32],"Takri":[71296,80],"Ahom":[71424,80],"Dogra":[71680,80],"Warang Citi":[71840,96],"Dives Akuru":[71936,96],"Nandinagari":[72096,96],"Zanabazar Square":[72192,80],"Soyombo":[72272,96],"Unified Canadian Aboriginal Syllabics Extended-A":[72368,16],"Pau Cin Hau":[72384,64],"Bhaiksuki":[72704,112],"Marchen":[72816,80],"Masaram Gondi":[72960,96],"Gunjala Gondi":[73056,80],"Makasar":[73440,32],"Lisu Supplement":[73648,16],"Tamil Supplement":[73664,64],"Cuneiform":[73728,1024],"Cuneiform Numbers and Punctuation":[74752,128],"Early Dynastic Cuneiform":[74880,208],"Cypro-Minoan":[77712,112],"Egyptian Hieroglyphs":[77824,1072],"Egyptian Hieroglyph Format Controls":[78896,16],"Anatolian Hieroglyphs":[82944,640],"Bamum Supplement":[92160,576],"Mro":[92736,48],"Tangsa":[92784,96],"Bassa Vah":[92880,48],"Pahawh Hmong":[92928,144],"Medefaidrin":[93760,96],"Miao":[93952,160],"Ideographic Symbols and Punctuation":[94176,32],"Tangut":[94208,6144],"Tangut Components":[100352,768],"Khitan Small Script":[101120,512],"Tangut Supplement":[101632,128],"Kana Extended-B":[110576,16],"Kana Supplement":[110592,256],"Kana Extended-A":[110848,48],"Small Kana Extension":[110896,64],"Nushu":[110960,400],"Duployan":[113664,160],"Shorthand Format Controls":[113824,16],"Znamenny Musical Notation":[118528,208],"Byzantine Musical Symbols":[118784,256],"Musical Symbols":[119040,256],"Ancient Greek Musical Notation":[119296,80],"Mayan Numerals":[119520,32],"Tai Xuan Jing Symbols":[119552,96],"Counting Rod Numerals":[119648,32],"Mathematical Alphanumeric Symbols":[119808,1024],"Sutton SignWriting":[120832,688],"Latin Extended-G":[122624,256],"Glagolitic Supplement":[122880,48],"Nyiakeng Puachue Hmong":[123136,80],"Toto":[123536,48],"Wancho":[123584,64],"Ethiopic Extended-B":[124896,32],"Mende Kikakui":[124928,224],"Adlam":[125184,96],"Indic Siyaq Numbers":[126064,80],"Ottoman Siyaq Numbers":[126208,80],"Arabic Mathematical Alphabetic Symbols":[126464,256],"Mahjong Tiles":[126976,48],"Domino Tiles":[127024,112],"Playing Cards":[127136,96],"Enclosed Alphanumeric Supplement":[127232,256],"Enclosed Ideographic Supplement":[127488,256],"Miscellaneous Symbols and Pictographs":[127744,768],"Emoticons":[128512,80],"Ornamental Dingbats":[128592,48],"Transport and Map Symbols":[128640,128],"Alchemical Symbols":[128768,128],"Geometric Shapes Extended":[128896,128],"Supplemental Arrows-C":[129024,256],"Supplemental Symbols and Pictographs":[129280,256],"Chess Symbols":[129536,112],"Symbols and Pictographs Extended-A":[129648,144],"Symbols for Legacy Computing":[129792,256],"CJK Unified Ideographs Extension B":[131072,42720],"CJK Unified Ideographs Extension C":[173824,4160],"CJK Unified Ideographs Extension D":[177984,224],"CJK Unified Ideographs Extension E":[178208,5776],"CJK Unified Ideographs Extension F":[183984,7488],"CJK Compatibility Ideographs Supplement":[194560,544],"CJK Unified Ideographs Extension G":[196608,4944],"Tags":[917504,128],"Variation Selectors Supplement":[917760,240],"Supplementary Private Use Area-A":[983040,65536],"Supplementary Private Use Area-B":[1048576,65536]}';
const blockData = JSON.parse(blocks);

function* allUnicodeCharacters() {
	for (const [start, length] of Object.values(blockData)) {
		for (let i = start; i < start + length; i++) {
			yield String.fromCodePoint(i);
		}
	}
}
