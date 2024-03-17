export function getMonarchGrammar() {
	return {
		keywords: [
			'X',
			'Y',
			'add',
			'and',
			'angle',
			'around',
			'as',
			'at',
			'cm',
			'constrain',
			'defaults',
			'define',
			'deg',
			'distance',
			'dm',
			'do',
			'end',
			'from',
			'ft',
			'horizontal',
			'import',
			'in',
			'length',
			'm',
			'mm',
			'partial',
			'perpendicular',
			'rad',
			'radius',
			'samelength',
			'th',
			'times',
			'to',
			'vertical',
			'yd',
			'Arc',
			'Circle',
			'Line',
			'Point',
			'Sketch'
		],

		//typeKeywords: [],

		operators: ['&', `'`, '*', '+', ',', '-', '->', '/', '=', '|', '°'],
		symbols: /&|'|\(|\)|\*|\+|,|-|->|\/|=|\||°/,

		tokenizer: {
			initial: [
				{
					regex: /[_a-zA-Z][\w_]*/,
					action: {
						cases: {
							'@keywords': { token: 'keyword' },
							//'@typeKeywords': { token: 'keyword.typeKeyword' },
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
