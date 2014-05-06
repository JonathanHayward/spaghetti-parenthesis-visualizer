// Surprised not to see a closure? I want to limit myself to one incursion into
// the global namespace, but leave things open for other people to tinker with,
// rather than using a JavaScript hack to lock up private variables.

var SPAGHETTI = {};

SPAGHETTI.indent_before_open_parenthesis = true;
SPAGHETTI.line_break_after_open_parenthesis = true;
SPAGHETTI.outdent_before_close_parenthesis = true;
SPAGHETTI.maximum_underline_so_far = 0;
SPAGHETTI.preserve_line_breaks = true;

SPAGHETTI.filter = function(character, indentation)
    {
    var result;
    if (character === '&')
        {
        result = '&amp;';
        }
    else if (character === '>')
        {
        result = '&gt;';
        }
    else if (character === '<')
        {
        result = '&lt;';
        }
    else
        {
        result = character;
        }
    if (indentation < 0)
        {
        result = '<span class="negative">' + character + '</span>';
        }
    return result;
    }

SPAGHETTI.is_close = function(character)
    {
    if (jQuery('#closing').val().indexOf(character) !== -1)
        {
        return true;
        }
    else
        {
        return false;
        }
    }

SPAGHETTI.is_opening = function(character)
    {
    if (jQuery('#opening').val().indexOf(character) !== -1)
        {
        return true;
        }
    else
        {
        return false;
        }
    }

SPAGHETTI.is_quote = function(character)
    {
    if (character === "'" || character === '"')
        {
        return true;
        }
    else
        {
        return false;
        }
    }

SPAGHETTI.update_parsed = function(tag, target)
    {
    var parenthesis_count = 0;
    var maximum_parenthesis_count = 0;
    var raw = jQuery('#source').val();
    var result = '';
    var previous_character = '';
    var quote_character = '';
    var in_quote = false;
    for(var index = 0; index < raw.length; ++index)
        {
        character = SPAGHETTI.filter(raw[index], parenthesis_count);
        if (SPAGHETTI.preserve_line_breaks && character === '\r')
            {
            result = result + '<br />\r';
            }
        else if (SPAGHETTI.preserve_line_breaks && character === '\n')
            {
            if (previous_character !== '\r')
                {
                result += '<br />\r';
                }
            result += character;
            }
        else if (SPAGHETTI.is_quote(character))
            {
            if (in_quote)
                {
                if (character === quote_character && previous_character !== '\\')
                    {
                    in_quote = false;
                    result = result + character + '</strong>';
                    }
                else
                    {
                    result = result + character;
                    }
                }
            else
                {
                result = result + '<strong>' + character;
                quote_character = character;
                in_quote = true;
                }
            }
        else if (in_quote)
            {
            result = result + character;
            }
        else if (SPAGHETTI.is_opening(character))
            {
            if (SPAGHETTI.indent_before_open_parenthesis)
                {
                parenthesis_count++;
                result = result + '<' + tag + ' class="indent">' + character;
                }
            else
                {
                result = result + character + '<' + tag + ' class="indent">';
                parenthesis_count++;
                }
            if (parenthesis_count > maximum_parenthesis_count)
                {
                maximum_parenthesis_count = parenthesis_count;
                }
            if (tag === 'div' && SPAGHETTI.line_break_after_open_parenthesis)
                {
                result += '<br />';
                }
            }
        else if (SPAGHETTI.is_close(character))
            {
            if (tag === 'div')
                {
                result += '<br />';
                }
            if (SPAGHETTI.outdent_before_close_parenthesis)
                {
                result = result + character + '</' + tag + '>';
                parenthesis_count--;
                }
            else
                {
                parenthesis_count--;
                result = result + '</' + tag + '>' + character;
                }
            }
        else
            {
            result += character;
            }

        previous_character = character;
        }
    jQuery('#' + target).html(result);
    if (maximum_parenthesis_count > SPAGHETTI.maximum_underline_so_far)
        {
        for(var outer = SPAGHETTI.maximum_underline_so_far; outer <= maximum_parenthesis_count; ++outer)
            {
            var identifier = '';
            for(var inner = 0; inner < outer; ++inner)
                {
                if (identifier)
                    {
                    identifier += ' span.indent';
                    }
                else
                    {
                    identifier = 'span.indent';
                    }
                }
            /* This seems not to have the desired effect; I've fallen back on a
             * static stylesheet.
             */
            var style = outer + 'px solid black';
            jQuery(identifier).css('border-bottom', style);
            }
        SPAGHETTI.maximum_underline_so_far = maximum_parenthesis_count;
        }
    }

jQuery('#source').change(function()
    {
    SPAGHETTI.update_parsed('div', 'unfurled');
    });


jQuery('#source').keydown(function()
    {
    SPAGHETTI.update_parsed('div', 'unfurled');
    });

jQuery('#source').keyup(function()
    {
    SPAGHETTI.update_parsed('div', 'unfurled');
    SPAGHETTI.update_parsed('span', 'underlined');
    });

jQuery('#source').bind('paste', function()
    {
    setTimeout(function()
        {
        SPAGHETTI.update_parsed('div', 'unfurled');
        SPAGHETTI.update_parsed('span', 'underlined');
        }, 100);
    });

jQuery('#linebreak').click(function()
    {
    SPAGHETTI.preserve_line_breaks = !SPAGHETTI.preserve_line_breaks;
    SPAGHETTI.update_parsed('div', 'unfurled');
    SPAGHETTI.update_parsed('span', 'underlined');
    });

if (Modernizr.localstorage)
    {
    if (window.localStorage.getItem('opening'))
        {
        jQuery('#opening').val(localStorage.getItem('opening'));
        }
    if (window.localStorage.getItem('closing'))
        {
        jQuery('#closing').val(localStorage.getItem('closing'));
        }
    jQuery('#opening').change(function()
        {
        localStorage.setItem('opening', jQuery('#opening').val());
        });
    jQuery('#closing').change(function()
        {
        localStorage.setItem('closing', jQuery('#closing').val());
        });
    }

SPAGHETTI.make_css_rules = function()
    {
    document.write('<style type="text/css">');
    var color = 'black';
    for(var outer = 0; outer < 1000; ++outer)
        {
        var identifier = '';
        for(var inner = 0; inner < outer; ++inner)
            {
            if (identifier)
                {
                identifier += ' span.indent';
                }
            else
                {
                identifier = 'span.indent';
                }
            }
        document.write(identifier);
        document.write('{');
        if (outer % 2 === 0)
            {
            color = 'black';
            }
        else
            {
            color = 'grey';
            }
        document.write((outer * 5) + 'px solid ' + color) + ';';
        document.write('}');
        }
    document.write('</style>');
    }

SPAGHETTI.make_css_rules();
