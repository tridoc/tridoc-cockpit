import Vue from 'vue'
import Vuex from 'vuex'
import Server from '@tridoc/frontend'

Vue.use(Vuex)

const servers: {
  server: Server;
  password: string;
  url: string;
}[] = []

function storeServers (state: {
  servers: typeof servers;
  currentServer: null | number;
  viewSettings: {
    darkMode: boolean;
    dense: boolean;
  };
}) {
  localStorage.setItem('currentserver', state.currentServer?.toString() || '')
  localStorage.setItem(
    'servers',
    JSON.stringify(state.servers.map(({ password, url }: { url: string; password?: string }) => ({
      password,
      url
    })))
  )
}

export default new Vuex.Store({
  state: {
    servers,
    currentServer: null as null | number,
    viewSettings: {
      darkMode: false,
      dense: false,
      grid: false,
    }
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
        }) - 1
      } else {
        storeServers(state)
        return null
      }
      storeServers(state)
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
      storeServers(state)
      return state.servers.length
    },
    removeServer (state, { index }: { index: number }) {
      if (index >= state.servers.length || index < 0) {
        console.warn('Trying to remove nonexistent server') // eslint-disable-line no-console
        return
      }
      state.servers.splice(index, 1)
      storeServers(state)
    },
    viewSettings (state, { darkMode, dense, grid }: { darkMode?: boolean; dense?: boolean; grid?: boolean }) {
      if (darkMode !== undefined) state.viewSettings.darkMode = darkMode
      if (dense !== undefined) state.viewSettings.dense = dense
      if (grid !== undefined) state.viewSettings.grid = grid
      localStorage.setItem('viewSettings', JSON.stringify(state.viewSettings))
    },
  },
  actions: {
    restore ({ commit }) {
      const storedServers = JSON.parse(localStorage.getItem('servers') || 'false');
      const storedCurrent = parseInt(localStorage.getItem('currentserver') || '0', 10);
      if (storedServers) {
        storedServers.forEach(({ password, url }: { password: string; url: string }) => {
          commit('addServer', { password, url })
        })
      }
      commit('currentServer', { index: storedCurrent })
      const storedViewSettings = JSON.parse(localStorage.getItem('viewSettings') || 'false')
      if (storedViewSettings) {
        commit('viewSettings', storedViewSettings)
      }
    }
  }
})
