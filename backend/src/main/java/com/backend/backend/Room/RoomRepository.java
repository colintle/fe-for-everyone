package com.backend.backend.Room;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface RoomRepository extends JpaRepository<Room, UUID>{
    List<Room> findByRoomID(UUID roomID);
}
