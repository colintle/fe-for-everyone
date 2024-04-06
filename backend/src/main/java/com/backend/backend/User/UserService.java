package com.backend.backend.User;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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

    public String addUser(User user){
        BCryptPasswordEncoder bycrypt = new BCryptPasswordEncoder();
        String encrypted = bycrypt.encode(user.getPassword());
        user.setPassword(encrypted);

        User savedUser = userRepository.save(user);
        return savedUser.getName() + "added to database successfully";
    }
}
