package com.backend.backend.User;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import java.util.List;
import com.backend.backend.Room.Room;


@Repository
public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findUserByUsername(String username);

    List<User> findByRoom(Room room);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.room = null WHERE u.room.roomID = :roomID")
    void nullifyRoomInUsers(@Param("roomID") UUID roomID);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.room WHERE u.id = :id")
    Optional<User> findByIdWithRoom(@Param("id") long id);

}