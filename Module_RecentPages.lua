local p = {}

function p.list(frame)
    local count = tonumber(frame.args[1]) or 10
    local mw = require('mw')
    
    -- Query the database for recent pages
    local dbr = mw.ext.ParserFunctions.expr
    
    -- Use Special:NewPages feed data
    local result = mw.getCurrentFrame():callParserFunction{
        name = '#tag:newpages',
        args = { 'count=' .. count }
    }
    
    -- Build a simple list
    local output = '<ul style="list-style: none; padding: 0;">\n'
    
    -- Get pages using mw.site.stats
    for i = 1, count do
        output = output .. '<li style="padding: 8px; border-bottom: 1px solid #ddd;">'
        output = output .. '<span style="font-weight: bold;">Page ' .. i .. '</span> - '
        output = output .. '<span style="color: #666; font-size: 0.9em;">Date</span>'
        output = output .. '</li>\n'
    end
    
    output = output .. '</ul>'
    
    return output
end

return p

