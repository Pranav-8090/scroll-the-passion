
FROM eclipse-temurin:20-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw && ./mvnw -B clean package -DskipTests

EXPOSE 8085

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8085} -jar target/*.jar"]
