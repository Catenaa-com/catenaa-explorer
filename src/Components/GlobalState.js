import { useContext, useState, createContext, useEffect } from 'react';

const StoreContext = createContext();

function WithGlobalState({ children, initialState, initFunction }) {
    let [state, setState] = useState({ ...initialState })

    useEffect(() => {
        async function effectHandler() {
            if (!initFunction) return;
            const newState = await initFunction();
            setState(newState);
        };
        effectHandler();
    },[]);

    return (
        <StoreContext.Provider value={[state, setState]}>
            {children}
        </StoreContext.Provider>
    );
}

function useGlobalState() {
    return useContext(StoreContext);
}

export { WithGlobalState, useGlobalState };