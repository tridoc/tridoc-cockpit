interface Tag {
  'icon': string;
  'label': string;
  'type-icon'?: string;
}

type tdQueryTag = [
  string,
  (string|number)?,
  (string|number)?,
]

interface Search {
  text: string;
  tags: tdQueryTag[];
  nottags: tdQueryTag[];
}
