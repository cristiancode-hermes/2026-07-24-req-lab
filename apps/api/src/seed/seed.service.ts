import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Workspace } from '../workspaces/workspace.entity';
import { Collection } from '../collections/collection.entity';
import { Request } from '../requests/request.entity';
import { Environment } from '../environments/environment.entity';
import { HistoryEntry } from '../history/history-entry.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspacesRepository: Repository<Workspace>,
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(Environment)
    private readonly environmentsRepository: Repository<Environment>,
    @InjectRepository(HistoryEntry)
    private readonly historyRepository: Repository<HistoryEntry>,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    const shouldSeed = this.configService.get<string>('SEED_DB', 'false');
    if (shouldSeed !== 'true') {
      this.logger.log('SEED_DB is not set to true, skipping seed');
      return;
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: 'demo@reqlab.dev' },
    });
    if (existingUser) {
      this.logger.log('Database already seeded, skipping');
      return;
    }

    this.logger.log('Seeding database...');

    const hashedPassword = await bcrypt.hash('demo123456', 10);
    const user = this.usersRepository.create({
      email: 'demo@reqlab.dev',
      password: hashedPassword,
      name: 'Demo User',
    } as unknown as User);
    const savedUser = await this.usersRepository.save(user) as unknown as User;
    this.logger.log(`Created demo user: ${savedUser.email}`);

    const workspace = this.workspacesRepository.create({
      userId: savedUser.id,
      name: 'My API Playground',
      description: 'A workspace for testing API requests',
    } as unknown as Workspace);
    const savedWorkspace = await this.workspacesRepository.save(workspace) as unknown as Workspace;
    this.logger.log(`Created workspace: ${savedWorkspace.name}`);

    const usersApiCollection = this.collectionsRepository.create({
      workspaceId: savedWorkspace.id,
      name: 'Users API',
      sortOrder: 1,
    } as unknown as Collection);
    const savedUsersCollection = await this.collectionsRepository.save(usersApiCollection) as unknown as Collection;

    const getUsersRequest = this.requestsRepository.create({
      collectionId: savedUsersCollection.id,
      name: 'Get All Users',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: [],
      params: [],
      sortOrder: 1,
    } as unknown as Request);
    await this.requestsRepository.save(getUsersRequest);

    const createUserRequest = this.requestsRepository.create({
      collectionId: savedUsersCollection.id,
      name: 'Create User',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      body: { name: 'John Doe', email: 'john@example.com' },
      sortOrder: 2,
    } as unknown as Request);
    await this.requestsRepository.save(createUserRequest);

    const deleteUserRequest = this.requestsRepository.create({
      collectionId: savedUsersCollection.id,
      name: 'Delete User',
      method: 'DELETE',
      url: 'https://jsonplaceholder.typicode.com/users/1',
      headers: [],
      params: [],
      sortOrder: 3,
    } as unknown as Request);
    await this.requestsRepository.save(deleteUserRequest);

    const authApiCollection = this.collectionsRepository.create({
      workspaceId: savedWorkspace.id,
      name: 'Auth API',
      sortOrder: 2,
    } as unknown as Collection);
    const savedAuthCollection = await this.collectionsRepository.save(authApiCollection) as unknown as Collection;

    const loginRequest = this.requestsRepository.create({
      collectionId: savedAuthCollection.id,
      name: 'Login',
      method: 'POST',
      url: 'https://reqres.in/api/login',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      body: { email: 'eve.holt@reqres.in', password: 'cityslicka' },
      sortOrder: 1,
    } as unknown as Request);
    await this.requestsRepository.save(loginRequest);

    const registerRequest = this.requestsRepository.create({
      collectionId: savedAuthCollection.id,
      name: 'Register',
      method: 'POST',
      url: 'https://reqres.in/api/register',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      body: { email: 'eve.holt@reqres.in', password: 'pistol' },
      sortOrder: 2,
    } as unknown as Request);
    await this.requestsRepository.save(registerRequest);

    const devEnv = this.environmentsRepository.create({
      workspaceId: savedWorkspace.id,
      name: 'Development',
      variables: [
        { key: 'base_url', value: 'http://localhost:3000' },
        { key: 'api_key', value: 'dev-key-123' },
      ],
      isActive: true,
    } as unknown as Environment);
    await this.environmentsRepository.save(devEnv);

    const prodEnv = this.environmentsRepository.create({
      workspaceId: savedWorkspace.id,
      name: 'Production',
      variables: [
        { key: 'base_url', value: 'https://api.example.com' },
        { key: 'api_key', value: 'prod-key-456' },
      ],
      isActive: false,
    } as unknown as Environment);
    await this.environmentsRepository.save(prodEnv);

    const historyEntry = this.historyRepository.create({
      workspaceId: savedWorkspace.id,
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      requestHeaders: [],
      responseStatus: 200,
      responseStatusText: 'OK',
      responseHeaders: [{ key: 'content-type', value: 'application/json' }],
      responseBody: JSON.stringify([{ id: 1, name: 'Leanne Graham' }]),
      responseSize: 100,
      timingMs: 245,
      timestamp: new Date(),
    } as unknown as HistoryEntry);
    await this.historyRepository.save(historyEntry);

    this.logger.log('Database seeded successfully!');
  }
}
