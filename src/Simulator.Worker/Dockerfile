# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

ENV NUGET_FALLBACK_PACKAGES="" \
	RestoreFallbackFolders=""

COPY ["NuGet.Config", "./"]
COPY ["GroupStageSim.sln", "./"]
COPY ["src/Simulator.Worker/Simulator.Worker.csproj", "src/Simulator.Worker/"]
COPY ["src/Tournament.Application/Tournament.Application.csproj", "src/Tournament.Application/"]
COPY ["src/Tournament.Infrastructure/Tournament.Infrastructure.csproj", "src/Tournament.Infrastructure/"]
COPY ["src/Tournament.Domain/Tournament.Domain.csproj", "src/Tournament.Domain/"]
COPY ["src/Contracts/Contracts.csproj", "src/Contracts/"]
RUN dotnet restore "src/Simulator.Worker/Simulator.Worker.csproj" --configfile NuGet.Config

COPY . .
RUN dotnet publish "src/Simulator.Worker/Simulator.Worker.csproj" -c Release -o /app/publish --configfile NuGet.Config

FROM mcr.microsoft.com/dotnet/runtime:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Simulator.Worker.dll"]
