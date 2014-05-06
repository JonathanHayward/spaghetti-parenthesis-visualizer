#!/usr/bin/python

toggle = True
for outer in range(1, 1000):
    identifier = ''
    for inner in range(outer):
        if identifier:
            identifier += ' span.indent'
        else:
            identifier = 'span.indent'
    print identifier
    print '    {'
    rule = '    border-bottom: '
    rule += str(5 * outer)
    rule += 'px solid '
    if toggle:
        rule += 'black'
    else:
        rule += '#808080'
    rule += ';'
    print rule
    print '    }'
    print ''
    toggle = not toggle
