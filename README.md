# babel-jest-import-glob

Wrapper of [babel-jest](https://www.npmjs.com/package/babel-jest) that makes
jest aware of wildcard glob imports using
[babel-plugin-import-glob](https://github.com/novemberborn/babel-plugin-import-glob).

`babel-jest` assumes a file is idempotent. When using `babel-plugin-import-glob`
an added or deleted file can change the transform. But `babe-jest` has no
way to pick up on this since the original file has not changed.

This wrapper looks for wildcard glob imports and uses
[glob](https://github.com/isaacs/node-glob) to prepend a comment block above
the file content. This allows `babel-jest` to see that the file needs
to be transformed again.

## Installation

```
npm install --save-dev babel-jest-import-glob
```

## Usage

package.json
```json
{
	"jest": {
		"transform": {
			"^.+\\.jsx?$": "babel-jest-import-glob"
		}
	}
}
```
