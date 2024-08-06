package com.backend.backend.Problem;

import jakarta.persistence.*;

import java.time.LocalDate;

import com.backend.backend.User.User;

@Entity
@Table(name = "problems", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userID", "problemStatementPath"})
})
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "problemID", updatable = false, nullable = false)
    private long id;

    @Column(name = "problemStatementPath", nullable = false)
    private String problemStatementPath;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userID", nullable = false, referencedColumnName = "userID")
    private User user;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getProblemStatementPath() {
        return problemStatementPath;
    }

    public void setProblemStatementPath(String problemStatementPath) {
        this.problemStatementPath = problemStatementPath;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
