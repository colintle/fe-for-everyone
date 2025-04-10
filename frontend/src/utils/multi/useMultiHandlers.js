export const useMultiHandlers = ({ setMembers, setAdmin, setCurrentProblem }) => {
    // roomData
    // {"welcome":"Welcome to room a4aba64d-6362-4472-9900-b60d03563e7b","users":[{"userID":"1","username":"colinle@ucf.edu","roomID":"a4aba64d-6362-4472-9900-b60d03563e7b"}],"roomInfo":{"admin":{"userID":"1","username":"colinle@ucf.edu","roomID":"a4aba64d-6362-4472-9900-b60d03563e7b"},"roomID":"a4aba64d-6362-4472-9900-b60d03563e7b","problemStatement":"Summer 2024","roomName":"test 1","code":""}}
    const handleInitialRoomData = (data) => {
        setMembers(data.members);
        setAdmin(data.admin);
        setCurrentProblem(data.currentProblem);
    }

    return {
        handleInitialRoomData
    }
}

