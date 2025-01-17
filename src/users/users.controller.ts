import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkoutDto } from '../workouts/dto/create-workout.dto';
import { WorkoutEntity } from '../workouts/entities/workout.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    type: UserEntity,
    description: 'Returns a user entity based on the ID provided',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'The data to create a new user',
    examples: {
      example1: {
        value: {
          username: 'johndoe',
          email: 'johndoe@example.com',
          password: 'securepassword123',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: UserEntity,
    description: 'Creates a new user and returns the created user entity',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user to be updated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'The data to update the user information',
    examples: {
      example1: {
        value: {
          email: 'newemail@example.com',
        },
      },
    },
  })
  @ApiOkResponse({
    type: UserEntity,
    description: 'Updates a user and returns the updated user entity',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an user by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to delete',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully. No content returned.',
  })
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all workouts for a user' })
  @ApiParam({
    name: 'id',
    description:
      'The unique identifier of the user whose workouts are retrieved',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    type: WorkoutEntity,
    isArray: true,
    description: 'Returns a list of workouts associated with the user',
  })
  @Get(':id/workouts')
  findAllWorkouts(@Param('id') id: string) {
    return this.userService.findAllWorkouts(id);
  }

  @Post(':id/workouts')
  @ApiOperation({ summary: 'Add a workout to a user' })
  @ApiParam({
    name: 'id',
    description:
      'The unique identifier of the user to whom the workout will be added',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateWorkoutDto,
    description: 'The workout data to add to a user',
    examples: {
      example1: {
        value: {
          name: 'Morning Strength Training',
          date: '2023-10-21T10:00:00.000Z',
          duration: 45,
          notes: 'Focus on lower body exercises',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: WorkoutEntity,
    description:
      'Adds a workout to a user and returns the created workout entity',
  })
  addWorkout(
    @Param('id') id: string,
    @Body() createWorkoutDto: CreateWorkoutDto,
  ) {
    return this.userService.addWorkout(id, createWorkoutDto);
  }
}
