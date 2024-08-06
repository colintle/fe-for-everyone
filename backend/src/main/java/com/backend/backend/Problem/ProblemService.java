package com.backend.backend.Problem;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.backend.backend.User.User;
import com.backend.backend.User.UserRepository;

@Service
public class ProblemService {
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    public ProblemService(UserRepository userRepository, ProblemRepository problemRepository){
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
    }

    public User getUserDetails(Authentication authentication){
        UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) authentication;
        User userDetails = (User) authToken.getPrincipal();
        return userDetails;
    }

    public Map<String,Object> completeProblem(Problem request, Authentication authentication){
        User user = getUserDetails(authentication);

        if (request.getProblemStatementPath().isEmpty() ){
            throw new IllegalArgumentException("One of the required fields is empty.");
        }

        String problemStatementPath = request.getProblemStatementPath();

        Problem existingProblem = problemRepository.findByUserAndProblemStatementPath(user, problemStatementPath);
        if (existingProblem != null) {
            throw new IllegalArgumentException("Problem already completed by this user.");
        }

        Problem newProblem = new Problem();
        newProblem.setUser(user);
        newProblem.setProblemStatementPath(problemStatementPath);
        newProblem.setDate(LocalDate.now());

        problemRepository.save(newProblem);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully added problem.");

        return response;
    }

    public Map<String,Object> removeProblem(Problem request, Authentication authentication){
        User user = getUserDetails(authentication);

        if (request.getProblemStatementPath().isEmpty()){
            throw new IllegalArgumentException("One of the required fields is empty.");
        }

        String problemStatementPath = request.getProblemStatementPath();
        Problem problem = problemRepository.findByUserAndProblemStatementPath(user, problemStatementPath);
        if (problem == null) {
            throw new IllegalArgumentException("No such problem found for this user.");
        }

        problemRepository.delete(problem);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully removed problem.");

        return response;
    }

    public User getUserWithProblems(long userId) {
        Optional<User> user = userRepository.findByIdWithProblems(userId);
        return user.orElse(null);
    }

    public Map<String, List<String>> completedProblems(Authentication authentication){
        User user = getUserDetails(authentication);
        user = getUserWithProblems(user.getId());
        
        List<String> problemPaths = user.getProblems().stream()
            .map(Problem::getProblemStatementPath)
            .collect(Collectors.toList());

        Map<String, List<String>> response = new HashMap<>();
        response.put("problems", problemPaths);

        return response;
    }
}
