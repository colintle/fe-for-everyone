package com.backend.backend.JWT;

public class JWT {
    private String token;
    private String username;

     public JWT(String token, String username) {
         this.token = token;
         this.username = username;
     }

     public String getToken() {
         return token;
    }

    public String getUsername(){
        return username;
    }
}
