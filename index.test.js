const createTransformer = require("./").createTransformer
const babelJest = require("babel-jest")
const glob = require("glob")
const minimatch = require("minimatch")

const globMock = files => (pattern, options) => (
	minimatch.match(files, pattern, options)
)

beforeAll(() => {
	jest.spyOn(babelJest, "createTransformer")
	jest.spyOn(glob, "sync")
})

beforeEach(() => {
	babelJest.createTransformer.mockReset()
	glob.sync.mockReset()
})

afterAll(() => {
	babelJest.createTransformer.mockRestore()
	glob.sync.mockRestore()
})

test("prepend comment block with wild glob imports", () => {
	babelJest.createTransformer.mockImplementation(() => ({
		getCacheKey: fileData => fileData.match(/^\/\*(\*(?!\/)|[^*])*\*\//)[0],
	}))
	glob.sync.mockImplementation(globMock([
		"./a.js",
		"./b.js",
		"./c.js",
		"./foo/a.js",
		"./foo/b.js",
		"./foo/c.js",
		"./bar/a.js",
		"./bar/b.js",
		"./bar/c.js",
	]))
	const result = createTransformer().getCacheKey(
		[
			"import * as abc from './*/a.js'",
			"import './*/b.js'",
			"import bar from 'bar.js'",
		].join("\n"),
		"foo.js"
	)
	expect(babelJest.createTransformer).toBeCalled()
	expect(glob.sync).toBeCalled()
	expect(result).toBe(
		"/* glob ./foo/a.js,./foo/b.js,./bar/a.js,./bar/b.js */"
	)
})

test("do not prepend comment block without wild glob imports", () => {
	babelJest.createTransformer.mockImplementation(() => ({
		getCacheKey: fileData => {
			const match = fileData.match(/^\/\*(\*(?!\/)|[^*])*\*\//)
			if (match) {
				return match[0]
			}
			return ""
		},
	}))
	glob.sync.mockImplementation(globMock([
		"./a.js",
		"./b.js",
		"./c.js",
		"./foo/a.js",
		"./foo/b.js",
		"./foo/c.js",
		"./bar/a.js",
		"./bar/b.js",
		"./bar/c.js",
	]))
	const result = createTransformer().getCacheKey(
		[
			"import {foo} from './*/a.js'",
			"import bar from 'bar.js'",
		].join("\n"),
		"foo.js"
	)
	expect(babelJest.createTransformer).toBeCalled()
	expect(glob.sync).not.toBeCalled()
	expect(result).not.toContain("/* glob")
})
