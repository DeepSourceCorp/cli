package validator

import (
	"errors"
	"os"
	"reflect"
	"strings"
	"testing"
	"unsafe"

	"github.com/google/go-cmp/cmp"
	"github.com/pelletier/go-toml/v2"
)

func TestParseTOMLErrorCodeFrame(t *testing.T) {
	type test struct {
		description   string
		codeframePath string
		want          []string
	}

	tests := []test{
		{
			description:   "empty codeframe",
			codeframePath: "./testdata/codeframe/codeframe_empty.txt",
			want:          []string{""},
		},
		{
			description:   "codeframe with field",
			codeframePath: "./testdata/codeframe/codeframe.txt",
			want:          []string{"key2"},
		},
		{
			description:   "codeframe with mixed formats",
			codeframePath: "./testdata/codeframe/codeframe_mixed.txt",
			want:          []string{""},
		},
		{
			description:   "codeframe with spaces",
			codeframePath: "./testdata/codeframe/codeframe_spaces.txt",
			want:          []string{"key2"},
		},
	}

	for _, tc := range tests {
		fileContent, err := os.ReadFile(tc.codeframePath)
		if err != nil {
			t.Errorf("error raised while running test (%s): %s\n", tc.description, err)
		}

		// Convert file content to string.
		codeframe := string(fileContent)
		codeframe = strings.TrimSpace(codeframe)

		got := parseTOMLErrorCodeFrame(codeframe)

		diff := cmp.Diff(got, tc.want)
		if len(diff) != 0 {
			t.Errorf("test failed (%s)\ngot != want:\n%s\n", tc.description, diff)
		}
	}
}

func TestHandleTOMLDecodeErrors(t *testing.T) {
	type test struct {
		description string
		err         error
		filePath    string
		want        *ValidationFailure
	}

	sampleDecodeErr := constructDecodeErr("cannot decode TOML integer into struct field types.AnalyzerTOML.Name of type string", 1, 1, "./testdata/codeframe/codeframe.txt")

	tests := []test{
		{
			description: "test error",
			err:         errors.New("test error"),
			filePath:    "analyzer.toml",
			want: &ValidationFailure{
				File: "analyzer.toml",
				Errors: []ErrorMeta{
					{
						Message: "test error",
					},
				},
			},
		},
		{
			description: "DecodeErr",
			err:         &sampleDecodeErr,
			filePath:    "analyzer.toml",
			want: &ValidationFailure{
				File: "analyzer.toml",
				Errors: []ErrorMeta{
					{
						Field:   "name",
						Message: `expected the field "name" of type string. Got integer.`,
					},
				},
			},
		},
	}

	for _, tc := range tests {
		got := handleTOMLDecodeErrors(tc.err, tc.filePath)

		diff := cmp.Diff(got, tc.want)
		if len(diff) != 0 {
			t.Errorf("test failed (%s)\ngot != want:\n%s\n", tc.description, diff)
		}
	}
}

func TestHandleStrictMissingError(t *testing.T) {
	type test struct {
		description string
		err         *toml.StrictMissingError
		filePath    string
		want        ValidationFailure
	}

	tests := []test{
		{
			description: "strict missing error",
			err: &toml.StrictMissingError{
				Errors: []toml.DecodeError{
					constructDecodeErr("strict mode: fields in the document are missing in the target struct", 1, 1, "./testdata/codeframe/codeframe.txt"),
				},
			},
			filePath: "analyzer.toml",
			want: ValidationFailure{
				File: "analyzer.toml",
				Errors: []ErrorMeta{
					{
						Field:   "key2",
						Message: "Invalid field found: key2",
					},
				},
			},
		},
	}

	for _, tc := range tests {
		got := handleStrictMissingError(tc.err, tc.filePath)

		diff := cmp.Diff(got, tc.want)
		if len(diff) != 0 {
			t.Errorf("test failed (%s)\ngot != want:\n%s\n", tc.description, diff)
		}
	}
}

func TestHandleDecodeError(t *testing.T) {
	type test struct {
		description string
		errMessage  string
		filePath    string
		want        ValidationFailure
	}

	tests := []test{
		{
			description: "cannot decode TOML",
			errMessage:  "toml: cannot decode TOML integer into struct field types.AnalyzerTOML.Name of type string",
			filePath:    "analyzer.toml",
			want: ValidationFailure{
				File: "analyzer.toml",
				Errors: []ErrorMeta{
					{
						Field:   "name",
						Message: `expected the field "name" of type string. Got integer.`,
					},
				},
			},
		},
		{
			description: "cannot store in Go slice",
			errMessage:  "toml: cannot store TOML string into a Go slice",
			filePath:    "analyzer.toml",
			want: ValidationFailure{
				File: "analyzer.toml",
				Errors: []ErrorMeta{
					{
						Field:   "",
						Message: "expected type for one of the fields : slice. Received: string.",
					},
				},
			},
		},
		{
			description: "random decoding error",
			errMessage:  "toml: random error",
			filePath:    "analyzer.toml",
			want: ValidationFailure{
				File: "analyzer.toml",
				Errors: []ErrorMeta{
					{
						Field:   "",
						Message: "toml: random error",
					},
				},
			},
		},
	}

	for _, tc := range tests {
		got := handleDecodeErr(tc.errMessage, tc.filePath)

		diff := cmp.Diff(got, tc.want)
		if len(diff) != 0 {
			t.Errorf("test failed (%s)\ngot != want:\n%s\n", tc.description, diff)
		}
	}
}

// getUnexportedField is a helper utility for extracting unexported fields from a struct.
func getUnexportedField(origin interface{}, fieldName string) reflect.Value {
	return reflect.ValueOf(origin).Elem().FieldByName(fieldName)
}

// setUnexportedField is a helper utility for setting the value for unexported fields inside a struct.
func setUnexportedField(field reflect.Value, value interface{}) {
	reflect.NewAt(field.Type(), unsafe.Pointer(field.UnsafeAddr())).
		Elem().
		Set(reflect.ValueOf(value))
}

// constructDecodeErr builds a toml.DecodeError response with the unexported fields being populated.
func constructDecodeErr(message string, line, column int, codeframePath string) toml.DecodeError {
	decodeErr := &toml.DecodeError{}

	// Get unexported fields from toml.DecodeErr.
	messageField := getUnexportedField(decodeErr, "message")
	lineField := getUnexportedField(decodeErr, "line")
	columnField := getUnexportedField(decodeErr, "column")
	humanField := getUnexportedField(decodeErr, "human")

	// Set unexported fields.
	setUnexportedField(messageField, message)
	setUnexportedField(lineField, line)
	setUnexportedField(columnField, column)

	// Read the codeframe from a file.
	fileContent, err := os.ReadFile(codeframePath)
	if err != nil {
		// If we can't parse the codeframe, then we can return decodeErr with all fields set except "human", which contains the codeframe representation.
		return *decodeErr
	}

	// Convert file content to string.
	codeframe := string(fileContent)
	codeframe = strings.TrimSpace(codeframe)

	// Set the "human" field with the codeframe.
	setUnexportedField(humanField, codeframe)

	return *decodeErr
}
