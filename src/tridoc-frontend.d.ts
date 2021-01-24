interface tdError {
  statusCode: number;
  error: string;
  message: string;
}

interface tdTag {
  label: string;
  parameter?: {
    type: 'http://www.w3.org/2001/XMLSchema#decimal' | 'http://www.w3.org/2001/XMLSchema#date';
  };
}

interface tdDocTag extends tdTag {
  parameter?: {
    type: 'http://www.w3.org/2001/XMLSchema#decimal' | 'http://www.w3.org/2001/XMLSchema#date';
    value: string;
  };
}

interface tdComment {
  text: string;
  created: string;
}

interface tdDoc {
  identifier: string;
  title?: string;
  created: string;
}

interface tdDocMeta {
  identifier: string;
  title?: string;
  created: string;
  tags?: tdTag[];
  comments?: tdComment[];
}
