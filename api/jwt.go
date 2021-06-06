package api

// // Fetches JWT
// func GetJWT(client *DSGQLClient, deviceCode string) (string, string, int64) {

//     var pollerMutation struct {
//         RequestJWT struct {
//             // Payload          interface{} `graphql:"payload"`
//             Token            string
//             RefreshToken     string
//             RefreshExpiresIn int64
//         } `graphql:"requestJwt(input: $input)"`
//     }

//     type RequestJWTInput struct {
//         DeviceCode graphql.String `json:"deviceCode"`
//     }

//     variables := map[string]interface{}{
//         "input": RequestJWTInput{
//             DeviceCode: graphql.String(deviceCode),
//         },
//     }

//     gq := client.gqlClient
//     _ = gq.Mutate(context.Background(), &pollerMutation, variables)
//     if pollerMutation.RequestJWT.Token != "" {
//         return pollerMutation.RequestJWT.Token, pollerMutation.RequestJWT.RefreshToken, pollerMutation.RequestJWT.RefreshExpiresIn
//     }
//     return "", "", 0
// }

// // Verifies the active status of JWT token
// func VerifyJWT(client *DSGQLClient, token string) (bool, error) {

//     var verifyToken struct {
//         VerifyToken struct {
//             Payload struct {
//                 Email   graphql.String `json:"email" graphql:"email"`
//                 Expiry  graphql.String `json:"exp" graphql:"exp"`
//                 OrigIAT graphql.Int    `json:"origIat" graphql:"origIat"`
//             } `json:"payload" graphql:"payload"`
//         } `graphql:"verifyToken(token: $token)"`
//     }

//     variables := map[string]interface{}{
//         "token": graphql.String(token),
//     }

//     gq := client.gqlClient
//     resp, err := gq.Mutate(context.Background(), &verifyToken, variables)
//     log.Println(resp)
//     if err != nil {
//         fmt.Println(err)
//         return false, err
//     }

//     return true, nil
// }
