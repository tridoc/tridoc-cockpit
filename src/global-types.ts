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

type tdQueryTagEx = [
  string,
  (string|number)?,
  (string|number)?,
  boolean?,
]

interface Search {
  text: string;
  tags: tdQueryTag[];
  nottags: tdQueryTag[];
}
