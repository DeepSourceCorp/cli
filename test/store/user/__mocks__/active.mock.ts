import { User } from "~/types/types";
import { ActiveUserModuleState } from "~/store/user/active"

/**
 * Mock for Active user detail.
 */
export const ACTIVE_USER_DETAIL: User = <User>{
  "id": "VXNlcjox",
  "fullName": "Aman Sharma",
  "firstName": "Aman",
  "lastName": "Sharma",
  "email": "aman@deepsource.io",
  "avatar": "https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/9e7acac4-9d55-4609-b5c3-a489c5e61459.jpeg",
  "lastLogin": "2020-11-13T07:59:34.027239+00:00",
  "isActive": true,
  "isStaff": true,
  "primaryOwner": null
}

/**
 * Mock -- Active user detail factory
 * @see ACTIVE_USER_DETAIL
 */
export const mockActiveUserDetail = (): User => ACTIVE_USER_DETAIL;

/**
 * Mock factory
 */
export const mockActiveUserState = (): ActiveUserModuleState => ({
  loading: false as boolean,
  error: {},
  viewer: mockActiveUserDetail()
});