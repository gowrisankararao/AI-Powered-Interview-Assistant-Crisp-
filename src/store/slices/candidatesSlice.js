import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  list: []
}

const slice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate(state, action) {
      state.list.push({ id: uuidv4(), ...action.payload })
    },
    updateCandidate(state, action) {
      const idx = state.list.findIndex(c => c.id === action.payload.id)
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload.updates }
    },
    setCandidates(state, action) {
      state.list = action.payload
    }
  }
})

export const { addCandidate, updateCandidate, setCandidates } = slice.actions
export default slice.reducer
