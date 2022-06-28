package render

// fetchIssueMetricsData fetches the metrics data to be rendered.
func (r *ResultRenderOpts) fetchIssueMetricsData() {
	metricsMap := make(map[string]float64)
	for _, metric := range r.AnalysisResultData.AnalysisResult.Metrics {
		if _, ok := r.MetricNameMap[metric.MetricCode]; !ok {
			continue
		}
		metricName := r.MetricNameMap[metric.MetricCode]
		metricsMap[metricName] = metric.Namespaces[0].Value
	}
	r.AnalysisResultData.MetricsMap = metricsMap
}
