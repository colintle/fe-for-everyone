FROM openjdk:17-jdk-alpine

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -T 4 dependency:go-offline

COPY src ./src

CMD ["./mvnw", "spring-boot:run"]