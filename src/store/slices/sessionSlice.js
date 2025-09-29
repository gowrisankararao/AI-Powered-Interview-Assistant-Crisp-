import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  current: null, // { candidateId, questionIndex, answers, startedAt, paused }
}

const slice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession(state, action) {
      state.current = action.payload
    },
    updateSession(state, action) {
      state.current = { ...state.current, ...action.payload }
    },
    endSession(state) {
      state.current = null
    }
  }
})

export const { startSession, updateSession, endSession } = slice.actions
export default slice.reducer
