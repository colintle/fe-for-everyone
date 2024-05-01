package com.backend.backend.Problem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.backend.backend.User.User;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByUser(User user);

    Problem findByUserAndProblemStatementPath(User user, String problemStatementPath);
}
