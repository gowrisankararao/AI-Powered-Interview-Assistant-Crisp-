import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import candidatesReducer from './slices/candidatesSlice'
import sessionReducer from './slices/sessionSlice'

const rootReducer = combineReducers({
  candidates: candidatesReducer,
  session: sessionReducer
})

const persistConfig = { key: 'swipe_root', storage }

const persisted = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persisted,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)
export default store
