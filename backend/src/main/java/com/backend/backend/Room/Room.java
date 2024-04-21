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
    @Column(name = "roomID", updatable = false, nullable = false)
    private UUID roomID;

    @Column(name = "roomName", nullable = false)
    private String roomName;

    @Column(name = "problemStatementPath")
    private String problemStatementPath;

    @Column(name = "userCount", nullable = false)
    private int userCount = 0;

    // Getters
    public UUID getRoomId() {
        return roomID;
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
    public void setRoomId(UUID roomID) {
        this.roomID = roomID;
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
