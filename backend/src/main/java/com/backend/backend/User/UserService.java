package com.backend.backend.User;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import io.micrometer.common.util.StringUtils;

public class UserService {
    @Autowired
    UserRepository userRepository;

    public String authenicateUser(User user) throws UserNotFoundException{
        BCryptPasswordEncoder bycrypt = new BCryptPasswordEncoder();
        Optional<User> opUser = userRepository.findUserByEmail(user.getEmail());

        if (opUser.isPresent()){
            User dbUser = opUser.get();
            if (bycrypt.matches(user.getPassword(), dbUser.getPassword())){
                return "Authenicated!";
            }
            else{
                throw new UserNotFoundException("Username or password is incorrect");
            }
        }
        throw new UserNotFoundException("Username or password is incorrect");
    }

    public String addUser(User request){
        if (request.getName().isEmpty() || 
            request.getEmail().isEmpty() || 
            request.getPassword().isEmpty()) {
            return "Name, email, and password must not be empty.";
        }

        if (userRepository.findUserByEmail(request.getEmail()).isPresent()) {
            return "User with email " + request.getEmail() + " already exists.";
        }

        BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
        String encrypted = bcrypt.encode(request.getPassword());

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encrypted);

        User savedUser = userRepository.save(user);
        return savedUser.getName() + " added to database successfully";
    }
}
