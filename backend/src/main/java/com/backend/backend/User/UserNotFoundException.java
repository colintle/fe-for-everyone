package com.backend.backend.User;

class UserNotFoundException extends Exception{
    public UserNotFoundException(String message) {
        super(message);
    }
}