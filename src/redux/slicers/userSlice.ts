import { createSlice } from '@reduxjs/toolkit'
import { PayloadAction } from '@reduxjs/toolkit'

type userState = {
    fullName: string
    email: string
    id: number
    loginned: boolean
    status: string
    savedInformation: number[]
}


const initialState = {
    userData:{
        fullName: '',
        email: '',
        id: 0,
        loginned: false,
        status: 'user',
        savedInformation: [0]
    }
}


export const userSlice = createSlice({
	name: 'userReducer',
	initialState,
	reducers: {
        setUserData: (state, action:PayloadAction<userState>)=>{
			state.userData = action.payload
		}
	}
})

export const { setUserData } = userSlice.actions

export const userReducer = userSlice.reducer
