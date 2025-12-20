# demo0809

## Spring Boot 项目命令行无侵入生成 Swagger 文档

下面方式不需要在业务代码里硬编码 Swagger 注解，只在构建工具里追加插件即可，运行命令行就能生成 `openapi.json/yaml`：

### Maven
1. 在 `pom.xml` 增加（或通过 `profile` 控制生效范围）：
   ```xml
   <dependency>
     <groupId>org.springdoc</groupId>
     <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
     <version>2.6.0</version>
   </dependency>

   <plugin>
     <groupId>org.springdoc</groupId>
     <artifactId>springdoc-openapi-maven-plugin</artifactId>
     <version>1.8.0</version>
     <executions>
       <execution>
         <goals>
           <goal>generate</goal>
         </goals>
       </execution>
     </executions>
     <configuration>
       <!-- 只扫描指定包/文件对应的 Controller，避免全量输出 -->
       <packagesToScan>com.example.demo.controller</packagesToScan>
       <outputFileName>openapi.json</outputFileName>
       <outputDir>${project.build.directory}</outputDir>
     </configuration>
   </plugin>
   ```
2. 运行命令行生成文档（无需启动应用）：
   ```bash
   mvn -DskipTests springdoc-openapi:generate
   ```
   生成的 Swagger(OpenAPI) 文件位于 `target/openapi.json`。

### Gradle
1. 在 `build.gradle`（Groovy 语法示例）加入：
   ```groovy
   dependencies {
       implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0'
   }

   plugins {
       id 'org.springdoc.openapi-gradle-plugin' version '1.8.0'
   }

   openapi {
       outputDir = file("$buildDir")
       outputFileName = 'openapi.json'
       packagesToScan = ['com.example.demo.controller'] // 仅指定文件/包
   }
   ```
2. 命令行生成：
   ```bash
   ./gradlew openapi
   ```
   输出文件在 `build/openapi.json`。

上述方案通过构建插件扫描已有代码生成 Swagger/OpenAPI 文档，做到对业务代码零侵入，并可通过 `packagesToScan` 精确限定需要生成的文件/包。
