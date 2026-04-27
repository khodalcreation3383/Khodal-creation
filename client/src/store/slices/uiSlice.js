import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,        // mobile drawer open/closed
    sidebarCollapsed: false    // desktop collapsed/expanded
  },
  reducers: {
    toggleSidebar:         (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen:        (state, action) => { state.sidebarOpen = action.payload },
    toggleSidebarCollapse: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed },
  }
})

export const { toggleSidebar, setSidebarOpen, toggleSidebarCollapse } = uiSlice.actions
export default uiSlice.reducer
