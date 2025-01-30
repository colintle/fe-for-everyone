package com.backend.backend.Problem;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/problem")
public class ProblemController {
    private final ProblemService problemService;

    public ProblemController(ProblemService problemService){
        this.problemService = problemService;
    }

    @PostMapping("/complete")
    public ResponseEntity<Object> completeProblem(@RequestBody Problem problem, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(problemService.completeProblem(problem, authentication));
    }

    @PostMapping("/remove")
    public ResponseEntity<Object> removeRoom(@RequestBody Problem problem, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(problemService.removeProblem(problem, authentication));
    }

    @GetMapping("/")
    public ResponseEntity<Object> allProblems(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(problemService.completedProblems(authentication));
    }
    
}
