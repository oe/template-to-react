export const htmlSyntax = `
  start
    = document

  document
    = element*

  element
    = tag / selfClosingTag / text

  tag
    = "<" tagName attributes space* ">" document "</" tagName ">"

  selfClosingTag
    = "<" tagName attributes space* "/>"

  tagName
    = identifier / placeholder

  identifier
    = [a-zA-Z][a-zA-Z0-9_]*

  placeholder
    = "{" identifier "}"

  attributes
    = attribute*

  attribute
    = space* identifier "=" quotedValue

  quotedValue
    = "\\"" [^"]* "\\""

  text
    = [^<]+

  space
    = " "
`;