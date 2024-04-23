export function getMonarchGrammar() {
	return {
		keywords: [
			'X',
			'Y',
			'and',
			'angle',
			'around',
			'as',
			'at',
			'defaults',
			'distance',
			'do',
			'end',
			'from',
			'horizontal',
			'import',
			'length',
			'partial',
			'perpendicular',
			'rad',
			'radius',
			'samelength',
			'to',
			'vertical'
		],

		typeKeywords: ['Arc', 'Circle', 'Line', 'Point', 'Sketch'],

		measureKeywords: ['yd', 'th', 'm', 'mm', 'in', 'ft', 'dm', 'deg', 'cm'],

		actionKeywords: ['add', 'constrain', 'define', 'times'],

		operators: ['&', `'`, '*', '+', ',', '-', '->', '/', '=', '|', '°'],
		symbols: /&|'|\(|\)|\*|\+|,|-|->|\/|=|\||°/,

		tokenizer: {
			initial: [
				{
					regex: /[_a-zA-Z][\w_]*/,
					action: {
						cases: {
							'@keywords': { token: 'keyword' },
							'@typeKeywords': { token: 'keyword.type' },
							'@measureKeywords': { token: 'keyword.measure' },
							'@actionKeywords': { token: 'keyword.action' },
							'@default': { token: 'ID' }
						}
					}
				},
				{ regex: /[0-9]+(\.[0-9]*)?/, action: { token: 'number' } },
				{ include: '@whitespace' },
				{
					regex: /@symbols/,
					action: { cases: { '@operators': { token: 'operator' }, '@default': { token: '' } } }
				}
			],
			whitespace: [
				{ regex: /\s+/, action: { token: 'white' } },
				{ regex: /\/\/[^\n\r]*/, action: { token: 'comment' } }
			],
			comment: []
		}
	}
}
