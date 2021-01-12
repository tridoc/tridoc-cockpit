declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vuetify/lib' {
  import 'vuetify/types/lib'
}

declare module 'util' {
  function inspect (obj: any): string;
}

declare module 'pdfvuer';
