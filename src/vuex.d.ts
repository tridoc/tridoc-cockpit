/* THIS ONLY WORKS WHEN REMOVING THE CONFLICTING TYPE Store<any> from /node_modules/vuex/types/vue.d.ts AND WAS THUS COMMENTED.

// 1. Make sure to import 'vue' before declaring augmented types
import Vue from 'vue'
import { Store } from 'vuex'
import type Server from '@tridoc/frontend'

interface State {
  servers: {
    server: Server;
    password: string;
    url: string;
  }[],
  currentServer: null | number,
}

// 2. Specify a file with the types you want to augment
//    Vue has the constructor type in types/vue.d.ts
declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
  interface Vue {
    $store: Store<State>
  }
}
*/