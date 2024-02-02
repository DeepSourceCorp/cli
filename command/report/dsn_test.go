package report

import (
	"reflect"
	"testing"
)

func TestNewDSN(t *testing.T) {
	type args struct {
		raw string
	}
	tests := []struct {
		name    string
		args    args
		want    *DSN
		wantErr error
	}{
		{
			name: "valid DSN",
			args: args{
				raw: "https://e1099ed7240c4045b5ab3fedebc7b5d7@app.deepsource.com",
			},
			want: &DSN{
				Token:    "e1099ed7240c4045b5ab3fedebc7b5d7",
				Host:     "app.deepsource.com",
				Protocol: "https",
			},
			wantErr: nil,
		},
		{
			name: "invalid DSN no http",
			args: args{
				raw: "no http",
			},
			want:    nil,
			wantErr: ErrInvalidDSN,
		},
		{
			name: "invalid DSN",
			args: args{
				raw: "https://e1099ed7240c4045b5ab3fedebc7b5d7",
			},
			want:    nil,
			wantErr: ErrInvalidDSN,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewDSN(tt.args.raw)
			if err != tt.wantErr {
				t.Errorf("NewDSN() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewDSN() = %v, want %v", got, tt.want)
			}
		})
	}
}
