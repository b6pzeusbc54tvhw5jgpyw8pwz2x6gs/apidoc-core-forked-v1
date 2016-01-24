var trim     = require('../utils/trim');

// Search: fieldname=value
// Example: "user.name='John Doe'"
//
// Naming convention:
//     b -> begin
//     e -> end
//     name -> the field value
//     wName -> wrapper for field
var regExp = {
    b:               '^',                                   // start
    wName: {
		b:               '\\s*(?:\\s*',                       // optional optional-marker
        //b:               '(\\[?\\s*',                       // 5 optional optional-marker
        name:                '([a-zA-Z0-9\\:\\.\\/\\\\_-]+',   // 1
		withArray:           '(?:\\[[a-zA-Z0-9\\.\\/\\\\_-]*\\])?)', // https://github.com/apidoc/apidoc-core/pull/4
        value: {                                    // value
            b:               '(?:\\s*=\\s*(?:',             // starting with '=', optional surrounding spaces
            withDoubleQuote:     '"([^"]*)"',               // 2
            withQuote:           '|\'([^\']*)\'',           // 3
            withoutQuote:        '|(.*?)(?:\\s|\\]|$)',     // 4
            e:               '))?'
        },
        e:               '\\s*)'
        //e:               '\\s*\\]?\\s*)'
    },
    e:               '$|@'
};

function _objectValuesToString(obj) {
    var str = '';
    for (var el in obj) {
        if (typeof obj[el] === 'string')
            str += obj[el];
        else
            str += _objectValuesToString(obj[el]);
    }
    return str;
}

var parseRegExp = new RegExp(_objectValuesToString(regExp));

var allowedValuesWithDoubleQuoteRegExp = new RegExp(/\"[^\"]*[^\"]\"/g);
var allowedValuesWithQuoteRegExp = new RegExp(/\'[^\']*[^\']\'/g);
var allowedValuesRegExp = new RegExp(/[^,\s]+/g);

function parse(content, source ) {
    content = trim(content);

    // replace Linebreak with Unicode
    content = content.replace(/\n/g, '\uffff');

    var matches = parseRegExp.exec(content);

    if ( ! matches)
        return null;

    var allowedValues = matches[4];
    if (allowedValues) {
        var regExp;
        if (allowedValues.charAt(0) === '"')
            regExp = allowedValuesWithDoubleQuoteRegExp;
        else if (allowedValues.charAt(0) === '\'')
            regExp = allowedValuesWithQuoteRegExp;
        else
            regExp = allowedValuesRegExp;

        var allowedValuesMatch;
        var list = [];

        while ( (allowedValuesMatch = regExp.exec(allowedValues)) ) {
            list.push(allowedValuesMatch[0]);
        }
        allowedValues = list;
    }

	console.log( 'field: ', matches[1] );
	var result = {};
	result[ matches[1] ] = matches[2] || matches[3] || matches[4];
	return result;

    return {
        field : matches[1],
        value : matches[2] || matches[3] || matches[4]
    };
}

function path() {
    return 'local.sampleRequestParameter';
}

/**
 * Exports
 */
module.exports = {
    parse         : parse,
    path  		  : path,
    method        : 'insert'
};

