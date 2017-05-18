const babelJest = require("babel-jest")
const path = require("path")
const glob = require("glob")

const createTransformer = options => {
	const transformer = babelJest.createTransformer(options)
	const getCacheKey = transformer.getCacheKey
	transformer.getCacheKey = (fileData, filename, ...args) => {
		const regexp = /^\s*import\s+(?:[^"'`{}]+\s)?(["'])(.+)\1/gm
		const patterns = []
		let match = regexp.exec(fileData)
		while (match != null) {
			const fileImport = match[2]
			if (glob.hasMagic(fileImport)) {
				patterns.push(fileImport.replace(/^glob:/, ""))
			}
			match = regexp.exec(fileData)
		}
		if (patterns.length > 0) {
			const pattern = "{" + patterns.join(",") + "}"
			const cwd = path.dirname(filename)
			const files = glob.sync(pattern, {cwd}).join(",")
			fileData = "/* glob " + files + " */\n" + fileData
		}
		return getCacheKey(fileData, filename, ...args)
	}
	return transformer
}

module.exports = createTransformer()
module.exports.createTransformer = createTransformer
