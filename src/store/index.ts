import Vue from 'vue'
import Vuex from 'vuex'
import Server from '@tridoc/frontend'

Vue.use(Vuex)

const servers: {
  server: Server;
  password: string;
  url: string;
}[] = []

export default new Vuex.Store({
  state: {
    servers,
    currentServer: null as null | number,
  },
  getters: {
    server: (state) => {
      if (state.currentServer === null) {
        return null
      }
      return state.servers[state.currentServer]
    }
  },
  mutations: {
    currentServer (state, { index }: { index: number }) {
      if (index >= state.servers.length || index < 0) {
        console.warn('Trying to select nonexistent server') // eslint-disable-line no-console
        return
      }
      state.currentServer = index
    },
    selectServer (state, { url, password }: { url: string; password?: string }) {
      const index = state.servers.findIndex(s => s.url === url)
      if (index > -1) {
        if (password && state.servers[index].password !== password) {
          state.servers[index] = {
            server: new Server(url, 'tridoc', password),
            password,
            url,
          }
        }
        state.currentServer = index
      } else if (password) {
        state.currentServer = state.servers.push({
          server: new Server(url, 'tridoc', password),
          password,
          url,
        })
      } else {
        return null
      }
      return state.currentServer
    },
    addServer (state, { url, password }: { url: string; password?: string }) {
      const index = state.servers.findIndex(s => s.url === url)
      if (index > -1) {
        if (password && state.servers[index].password !== password) {
          state.servers[index] = {
            server: new Server(url, 'tridoc', password),
            password,
            url,
          }
        }
      } else if (password) {
        state.servers.push({
          server: new Server(url, 'tridoc', password),
          password,
          url,
        })
      }
      return state.servers.length
    },
    removeServer (state, { index }: { index: number }) {
      if (index >= state.servers.length || index < 0) {
        console.warn('Trying to remove nonexistent server') // eslint-disable-line no-console
        return
      }
      state.servers.splice(index, 1)
    }
  },
  actions: {
  },
  modules: {
  }
})
