import { js2xml } from 'xml-js';

interface XmlNode {
  type: string;
  name: string;
  elements?: XmlNode[];
  attributes?: { [key: string]: string };
  text?: string;
}

export const convertToXml = (data: any, messageFields: any[]): string => {
  const createXmlNode = (path: string, value: any): XmlNode => {
    const field = messageFields.find(f => f.path === path);
    if (!field) return { type: 'element', name: 'unknown', text: value };

    return {
      type: 'element',
      name: field.tag,
      text: value
    };
  };

  const buildXmlStructure = (data: any): XmlNode => {
    const root: XmlNode = {
      type: 'element',
      name: 'Document',
      elements: []
    };

    Object.entries(data).forEach(([path, value]) => {
      if (value) {
        const node = createXmlNode(path, value);
        if (root.elements) {
          root.elements.push(node);
        }
      }
    });

    return root;
  };

  const xmlStructure = buildXmlStructure(data);
  const xmlOptions = {
    compact: false,
    spaces: 2,
    fullTagEmptyElement: true
  };

  return js2xml(xmlStructure, xmlOptions);
}; 