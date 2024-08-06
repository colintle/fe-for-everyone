package com.backend.backend.Problem;
import java.time.LocalDate;

public class ProblemDTO {
    private String problemStatementPath;
    private LocalDate date;

    public ProblemDTO(String problemStatementPath, LocalDate date) {
        this.problemStatementPath = problemStatementPath;
        this.date = date;
    }

    public String getProblemStatementPath() {
        return problemStatementPath;
    }

    public void setProblemStatementPath(String problemStatementPath) {
        this.problemStatementPath = problemStatementPath;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
