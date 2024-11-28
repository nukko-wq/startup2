import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Tab {
	id?: number;
	title: string;
	url: string;
	faviconUrl: string;
}

interface TabsState {
	tabs: Tab[];
	loading: boolean;
	error: string | null;
}

const initialState: TabsState = {
	tabs: [],
	loading: false,
	error: null,
};

const tabsSlice = createSlice({
	name: "tabs",
	initialState,
	reducers: {
		setTabs: (state, action: PayloadAction<Tab[]>) => {
			state.tabs = action.payload;
			state.loading = false;
			state.error = null;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
			state.loading = false;
		},
	},
});

export const { setTabs, setLoading, setError } = tabsSlice.actions;
export default tabsSlice.reducer;
