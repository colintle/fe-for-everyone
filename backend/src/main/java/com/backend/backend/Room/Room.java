package com.backend.backend.Room;

import jakarta.persistence.*;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "roomId", updatable = false, nullable = false)
    private UUID roomId;

    @Column(name = "roomName", nullable = false)
    private String roomName;

    @Column(name = "problemStatementPath")
    private String problemStatementPath;

    @Column(name = "userCount", nullable = false)
    private int userCount = 0;

    // Getters
    public UUID getRoomId() {
        return roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public String getProblemStatementPath() {
        return problemStatementPath;
    }

    public int getUserCount() {
        return userCount;
    }

    // Setters
    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public void setProblemStatementPath(String problemStatementPath) {
        this.problemStatementPath = problemStatementPath;
    }

    public void setUserCount(int userCount) {
        this.userCount = userCount;
    }

    // Utility methods to increment and decrement user count
    public void incrementUserCount() {
        this.userCount++;
    }

    public void decrementUserCount() {
        this.userCount = Math.max(0, this.userCount - 1); // Ensure userCount doesn't go below 0
    }
}
